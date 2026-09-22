package com.bookingnailms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.bookingnailms.exception.BadRequestException;
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.util.Map;

@Service
public class CloudinaryImageService {
    private final String cloud, key, secret;
    public CloudinaryImageService(@Value("${CLOUDINARY_CLOUD_NAME:}") String cloud,
            @Value("${CLOUDINARY_API_KEY:}") String key, @Value("${CLOUDINARY_API_SECRET:}") String secret) {
        this.cloud=cloud; this.key=key; this.secret=secret;
    }
    public String upload(MultipartFile file) {
        byte[] bytes;
        if(file.isEmpty() || file.getSize()>5*1024*1024) throw new BadRequestException("Ảnh phải nhỏ hơn hoặc bằng 5 MB.");
        try {
            bytes=file.getBytes();
            try(var input=ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers=ImageIO.getImageReaders(input);
                if(!readers.hasNext()) throw new BadRequestException("Chỉ hỗ trợ ảnh JPG hoặc PNG.");
                var reader=readers.next();
                try {
                    reader.setInput(input);
                    var format=reader.getFormatName();
                    if(!format.equalsIgnoreCase("JPEG") && !format.equalsIgnoreCase("PNG")) throw new BadRequestException("Chỉ hỗ trợ ảnh JPG hoặc PNG.");
                    if((long)reader.getWidth(0)*reader.getHeight(0)>25000000) throw new BadRequestException("Ảnh tối đa 25 megapixel.");
                    if(reader.read(0)==null) throw new BadRequestException("Ảnh không hợp lệ.");
                } finally { reader.dispose(); }
            }
        } catch(BadRequestException e) { throw e; }
        catch(Exception e) { throw new BadRequestException("Không đọc được ảnh."); }
        if(!cloud.matches("[a-zA-Z0-9_-]+") || key.isBlank() || secret.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Chưa cấu hình Cloudinary trên backend.");
        var factory=new SimpleClientHttpRequestFactory(); factory.setConnectTimeout(10000); factory.setReadTimeout(45000);
        var client=new RestTemplate(factory);
        var headers=new HttpHeaders(); headers.setBasicAuth(key,secret); headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        var body=new LinkedMultiValueMap<String,Object>();
        body.add("file",new ByteArrayResource(bytes){@Override public String getFilename(){return "photo";}});
        body.add("folder","ellora");
        try {
            var response=client.postForObject("https://api.cloudinary.com/v1_1/"+cloud+"/image/upload",new HttpEntity<>(body,headers),Map.class);
            if(response==null || !(response.get("secure_url") instanceof String url) || !url.startsWith("https://res.cloudinary.com/")) throw new IllegalStateException();
            return url;
        } catch(Exception e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Không tải được ảnh lên Cloudinary. Vui lòng thử lại."); }
    }
}
