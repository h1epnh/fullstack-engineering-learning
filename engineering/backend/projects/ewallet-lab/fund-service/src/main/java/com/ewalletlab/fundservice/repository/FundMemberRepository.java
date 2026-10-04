package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundMemberRepository extends JpaRepository<FundMember, UUID> {

    Optional<FundMember> findByFundIdAndMemberUserId(UUID fundId, UUID memberUserId);

    List<FundMember> findByFundIdOrderByJoinedAtAsc(UUID fundId);

    List<FundMember> findByMemberUserId(UUID memberUserId);

    boolean existsByFundIdAndMemberUserId(UUID fundId, UUID memberUserId);
}
